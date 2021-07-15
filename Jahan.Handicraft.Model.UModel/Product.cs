using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Jahan.Handicraft.Model.UModel.ViewModel;
using umbraco;
using Umbraco.Core;
using Umbraco.Core.Models;
using Umbraco.Web;
using Jahan.Handicraft.Model.UModel.Helper;

namespace Jahan.Handicraft.Model.UModel
{

    public class Product : BaseEntity
    {
        public string ProductName { get; set; }
        public string Description { get; set; }
        public string FirstTitle { get; set; }
        public string SecondTitle { get; set; }
        //public List<ProductType> ProductTypeList { get; set; }
        public List<Photo> PhotoList { get; set; }
        public string Icon { get; set; }
        public string MainPicture { get; set; }
        public string Price { get; set; }
        public string PictureForRelatedLinks { get; set; }
        public string Author { get; set; }
        public List<ProductRelatedLink> RelatedProductList { get; set; }

        public string FirstPartOfPrice
        {
            get
            {
                return Price.FirstPartOfString('.', string.Empty);
            }
        }
        public string SecondPartOfPrice
        {
            get
            {
                return Price.SecondPartOfString('.', string.Empty);
            }
        }
        public static Product GetProductById(int id)
        {
            //IContent con = ApplicationContext.Current.Services.ContentService.GetById(id);
            var umbracoHelper = new Umbraco.Web.UmbracoHelper(Umbraco.Web.UmbracoContext.Current);
            IPublishedContent content = umbracoHelper.TypedContent(id);
            Product model = (Product)Activator.CreateInstance(typeof(Product), content);
            return model;
        }
        public Product()
        {
        }
        public Product(IContent con)
        {
            Initialize((IPublishedContent)con, null);
        }
        public Product(IPublishedContent content, CultureInfo culture) : base(content, culture)
        {
            Initialize(content, culture);
        }

        public Product(IPublishedContent content) : base(content)
        {
            Initialize(content, null);
        }

        public override sealed void Initialize(IPublishedContent content, CultureInfo culture)
        {
            if (content != null)
            {
                ProductName = content.GetPropertyValue("ProductName").ToString();
                Description = content.GetPropertyValue("Description").ToString();
                FirstTitle = content.GetPropertyValue<string>("FirstTitle");
                SecondTitle = content.GetPropertyValue<string>("SecondTitle");
                MainPicture = content.GetPropertyValue<string>("MainPicture");
                //ProductTypeList = GetChildrenOfTargetNode<ProductType>(content, "ProductTypes", culture);
                PhotoList = GetChildrenOfTargetNode<Photo>(content, "PhotoCollection", culture);
                Icon = content.GetPropertyValue<string>("Icon");
                Price = content.GetPropertyValue<string>("Price");
                Author = content.GetPropertyValue<string>("Author");
                PictureForRelatedLinks = content.GetPropertyValue<string>("PictureForRelatedLinks");
                RelatedProductList = (new ProductRelatedLink()).Get(content, culture);
            }
        }
    }
}
