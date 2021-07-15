using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json.Linq;
using Umbraco.Core.Models;
using Umbraco.Web;

namespace Jahan.Handicraft.Model.UModel
{
    public abstract class BaseEntity 
    {
        //public abstract string DocType { set; }
        public int Id { get; set; }
        public DateTime CreateDate { get; set; }
        public DateTime UpdateDate { get; set; }
        public string Url { get; set; }
        //public string PageTitle { get; set; }
        //public string MetaDescription { get; set; }
        //public string MetaKeywords { get; set; }
        public abstract void Initialize(IPublishedContent content, CultureInfo culture);

        protected BaseEntity()
        {

        }

        protected BaseEntity(IPublishedContent content, CultureInfo culture)
        {
            if (content != null)
            {
                Id = content.Id;
                CreateDate = content.CreateDate;
                UpdateDate = content.UpdateDate;
                Url = content.Url;
                //PageTitle = content.GetPropertyValue("PageTitle").ToString();
                //MetaDescription = content.GetPropertyValue("MetaDescription").ToString();
                //MetaKeywords = content.GetPropertyValue("MetaKeywords").ToString();
            }
        }

        protected BaseEntity(IPublishedContent content)
        {
            if (content != null)
            {
                Id = content.Id;
                CreateDate = content.CreateDate;
                UpdateDate = content.UpdateDate;
                Url = content.Url;
                //PageTitle = content.GetPropertyValue("PageTitle").ToString();
                //MetaDescription = content.GetPropertyValue("MetaDescription").ToString();
                //MetaKeywords = content.GetPropertyValue("MetaKeywords").ToString();
            }
        }
        public virtual List<TChild> GetChildren<TChild>(IPublishedContent content) where TChild : BaseEntity, new()
        {
            List<TChild> list = new List<TChild>();
            foreach (var child in content.Children)
            {
                if (child.DocumentTypeAlias == typeof(TChild).Name)
                {
                    object[] args = new object[] { child };
                    TChild tChild = (TChild)Activator.CreateInstance(typeof(TChild), args);
                    list.Add(tChild);
                }
            }
            return list;
        }
        public virtual List<TChild> GetChildrenOfTargetNode<TChild>(IPublishedContent content, string docTypeOfTargetNode, CultureInfo culture) where TChild : BaseEntity, new()
        {
            List<TChild> list = new List<TChild>();
            IPublishedContent productTypesNode = content.Children.Where(c => c.DocumentTypeAlias.Equals(docTypeOfTargetNode)).SingleOrDefault();
            if (productTypesNode != null)
            {
                foreach (IPublishedContent child in productTypesNode.Children)
                {
                    object[] args = new object[] { child };
                    TChild tChild = (TChild)Activator.CreateInstance(typeof(TChild), args);
                    list.Add(tChild);
                }
                var prop = productTypesNode.Properties;
            }

            return list;
        }
    }
}
