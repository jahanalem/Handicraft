using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json.Linq;
using umbraco.NodeFactory;
using Umbraco.Core.Models;
using Umbraco.Web;

namespace Jahan.Handicraft.Model.UModel
{
    public class RelatedLinks : BaseEntity
    {
        public virtual string LinkUrl { get; set; }
        public virtual string Caption { get; set; }
        public virtual string LinkTarget { get; set; }
        public virtual int InternalLinkId { get; set; }
        public override void Initialize(IPublishedContent content, CultureInfo culture)
        {
            throw new NotImplementedException();
        }

        public static List<RelatedLinks> GetProperties(IPublishedContent content, string docTypeOfChildNode,string docTypeOfRelatedLink, CultureInfo culture)
        {
            List<RelatedLinks> results = new List<RelatedLinks>();
            IPublishedContent productTypesNode = content.Children.Where(c => c.DocumentTypeAlias.Equals(docTypeOfChildNode)).SingleOrDefault();
            if (productTypesNode != null)
            {
                if (productTypesNode.HasValue(docTypeOfRelatedLink) && productTypesNode.GetPropertyValue<string>(docTypeOfRelatedLink).Length > 2)
                {
                    foreach (var item in productTypesNode.GetPropertyValue<JArray>(docTypeOfRelatedLink))
                    {
                        var r = new RelatedLinks();
                        r.LinkUrl = item.Value<string>("link");
                        r.LinkTarget = item.Value<bool>("newWindow") ? "_blank" : null;
                        r.Caption = item.Value<string>("caption");
                        r.InternalLinkId = item.Value<int>("internal");
                        results.Add(r);
                    }
                }
            }
            return results;
        }

        public static List<RelatedLinks> GetProperties(IPublishedContent content, string docTypeOfRelatedLink, CultureInfo culture)
        {
            List<RelatedLinks> results = new List<RelatedLinks>();
            IPublishedContent productTypesNode = content;
            if (productTypesNode != null)
            {
                if (productTypesNode.HasValue(docTypeOfRelatedLink) && productTypesNode.GetPropertyValue<string>(docTypeOfRelatedLink).Length > 2)
                {
                    JArray items = productTypesNode.GetPropertyValue<JArray>(docTypeOfRelatedLink);
                    foreach (var item in items)
                    {
                        var r = new RelatedLinks();
                        r.LinkUrl = item.Value<string>("link");
                        r.LinkTarget = item.Value<bool>("newWindow") ? "_blank" : null;
                        r.Caption = item.Value<string>("caption");
                        r.InternalLinkId = item.Value<int>("internal");
                        results.Add(r);
                    }
                   
                }
            }
            return results;
        }

        public static List<RelatedLinks> GetProperty()
        {
            List<RelatedLinks> result = new List<RelatedLinks>();

            return result;
            /*
            {
                "caption": "Lorem ipsum dolor",
              
                
                "edit": false,
                "isInternal": true,
                "type": "internal",
                "title": "Lorem ipsum dolor",
                "internal": 1090,
                "internalName": "Fruit Cake",
                "internalIcon": "icon-gift color-red"
             },
            */
        }
    }
}
